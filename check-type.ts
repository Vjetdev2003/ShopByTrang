import { PrismaClient, Prisma } from '@prisma/client';

// Check Product tags type
type ProductCreateInput = Prisma.ProductCreateInput;
type TagsType = ProductCreateInput['tags'];

// Check Variant images type
type VariantCreateInput = Prisma.VariantCreateInput;
type ImagesType = VariantCreateInput['images'];

const p: TagsType = ["string"]; // ✅ Correct: Array of strings
const v: ImagesType = ["string"]; // ✅ Correct: Array of strings

console.log('Types checked');
