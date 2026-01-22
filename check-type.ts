import { PrismaClient, Prisma } from '@prisma/client';

// Check Product tags type
type ProductCreateInput = Prisma.ProductCreateInput;
type TagsType = ProductCreateInput['tags'];

// Check Variant images type
type VariantCreateInput = Prisma.VariantCreateInput;
type ImagesType = VariantCreateInput['images'];

const p: TagsType = "string"; // Should pass if String
const v: ImagesType = "string"; // Should pass if String

console.log('Types checked');
