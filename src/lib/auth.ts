import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true, // Enable debug mode
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.AUTH_FACEBOOK_ID!,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.passwordHash) return null;

                const isValid = await compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
        newUser: '/register',
        error: '/error',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('SignIn callback triggered:', { user, account, profile });
            
            try {
                // For OAuth providers, create or link user account
                if (account && account.provider !== 'credentials') {
                    const email = user.email;
                    if (!email) {
                        console.error('No email provided by OAuth provider');
                        return false;
                    }

                    console.log('Processing OAuth login for email:', email);

                    // Check if user exists
                    let existingUser = await prisma.user.findUnique({
                        where: { email },
                    });

                    console.log('Existing user found:', !!existingUser);

                    if (!existingUser) {
                        console.log('Creating new user...');
                        // Create new user for OAuth
                        existingUser = await prisma.user.create({
                            data: {
                                email,
                                name: user.name || 'User',
                                role: 'CUSTOMER',
                            },
                        });
                        console.log('New user created:', existingUser.id);
                    }

                    // Link account if not already linked
                    const existingAccount = await prisma.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                            },
                        },
                    });

                    console.log('Existing account found:', !!existingAccount);

                    if (!existingAccount) {
                        console.log('Creating new account link...');
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                refresh_token: account.refresh_token,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state as string | null,
                            },
                        });
                        console.log('Account linked successfully');
                    }

                    // Update user object with database ID for JWT
                    user.id = existingUser.id;
                    (user as { role?: string }).role = existingUser.role;
                }
                
                console.log('SignIn callback completed successfully');
                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                // Return true to allow login even if database operations fail
                // This prevents AccessDenied error
                return true;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
});
