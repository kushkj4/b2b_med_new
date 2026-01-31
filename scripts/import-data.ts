/**
 * Data Import Script
 * Imports companies and products from the Excel file into MongoDB
 * 
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/import-data.ts
 */

import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import path from 'path';

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://medb2b:abcd1234@cluster0.e86acbx.mongodb.net/b2b_med_platform?retryWrites=true&w=majority';

// Define schemas inline for script
const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    corporate: { type: String, trim: true },
    type: { type: String, enum: ['INDIAN', 'MNC'], default: 'INDIAN' },
    divisions: [{ type: String }],
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    mother_brand: { type: String, trim: true },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    company_name: { type: String, trim: true },
    therapy: { type: String, trim: true },
    super_group: { type: String, trim: true },
    sub_supergroup: { type: String, trim: true },
    group: { type: String, trim: true },
    class: { type: String, trim: true },
    drug_type: { type: String, trim: true },
    drug_category: { type: String, trim: true },
    subgroup: { type: String, trim: true },
    strength: { type: String, trim: true },
    pack: { type: String, trim: true },
    pack_unit: { type: Number },
    schedule: { type: String, trim: true },
    is_rx_required: { type: Boolean, default: false },
    nlem: { type: String, trim: true },
    acute_chronic: { type: String, trim: true },
    plain_combination: { type: String, trim: true },
    mrp: { type: Number, required: true },
    ptr: { type: Number },
    pts: { type: Number },
    brand_launch_date: { type: Date },
    sku_launch_date: { type: Date },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const Company = mongoose.model('Company', CompanySchema);
const Product = mongoose.model('Product', ProductSchema);

interface ExcelRow {
    SKU: string;
    BRAND: string;
    'MOTHER BRAND': string;
    'BRAND LAUNCH DATE': number;
    SUBGROUP: string;
    'SKU LAUNCH DATE': number;
    'NLEM 22': string;
    'PLAIN/COMBINATION': string;
    'PLAIN/COMBINATION SPLIT': string;
    'ACUTE/CHRONIC': string;
    'SUPER GROUP': string;
    'SUB SUPERGROUP': string;
    GROUP: string;
    CLASS: string;
    THERAPY: string;
    COMPANY: string;
    CORPORATE: string;
    'INDIAN/MNC': string;
    DIVISION: string;
    'DRUG TYPE': string;
    'DRUG CATEGORY': string;
    STRENGTH: string;
    PACK: string;
    'PACK UNIT': number;
    MRP: number;
    PTR: number;
    PTS: number;
}

function excelDateToJSDate(excelDate: number): Date | null {
    if (!excelDate || isNaN(excelDate)) return null;
    // Excel dates are days since 1900-01-01
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return isNaN(date.getTime()) ? null : date;
}

async function importData() {
    console.log('🚀 Starting data import...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read Excel file
    const excelPath = path.join(__dirname, '../data/Brand&Company Details.xlsb');
    console.log(`📂 Reading Excel file: ${excelPath}`);

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON, skip first row (it's a header row before the actual headers)
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // First row is the actual header
    const headers = rawData[1] as string[];
    const dataRows = rawData.slice(2); // Skip the first two rows

    console.log(`📊 Found ${dataRows.length} products\n`);

    // Extract unique companies
    console.log('🏢 Extracting companies...');
    const companyMap = new Map<string, { corporate: string; type: string; divisions: Set<string> }>();

    dataRows.forEach((row: unknown[]) => {
        const companyName = row[headers.indexOf('COMPANY')] as string;
        const corporate = row[headers.indexOf('CORPORATE')] as string;
        const type = row[headers.indexOf('INDIAN/MNC')] as string;
        const division = row[headers.indexOf('DIVISION')] as string;

        if (companyName) {
            if (!companyMap.has(companyName)) {
                companyMap.set(companyName, {
                    corporate: corporate || companyName,
                    type: type === 'MNC' ? 'MNC' : 'INDIAN',
                    divisions: new Set(),
                });
            }
            if (division) {
                companyMap.get(companyName)!.divisions.add(division);
            }
        }
    });

    console.log(`✅ Found ${companyMap.size} unique companies\n`);

    // Clear existing data (optional - comment out if you want to preserve)
    console.log('🗑️  Clearing existing data...');
    await Company.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert companies
    console.log('💾 Inserting companies...');
    const companyIdMap = new Map<string, mongoose.Types.ObjectId>();

    const companyDocs = Array.from(companyMap.entries()).map(([name, data]) => ({
        name,
        corporate: data.corporate,
        type: data.type,
        divisions: Array.from(data.divisions),
        is_active: true,
    }));

    const insertedCompanies = await Company.insertMany(companyDocs, { ordered: false });

    insertedCompanies.forEach((company) => {
        companyIdMap.set(company.name, company._id as mongoose.Types.ObjectId);
    });

    console.log(`✅ Inserted ${insertedCompanies.length} companies\n`);

    // Insert products in batches
    console.log('💊 Inserting products...');
    const BATCH_SIZE = 1000;
    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
        const batch = dataRows.slice(i, i + BATCH_SIZE);

        const productDocs = batch.map((row: unknown[]) => {
            const sku = row[headers.indexOf('SKU')] as string;
            const companyName = row[headers.indexOf('COMPANY')] as string;
            const mrp = row[headers.indexOf('MRP')] as number;

            if (!sku || !mrp) {
                skippedCount++;
                return null;
            }

            return {
                sku,
                name: sku, // SKU is the product name in this dataset
                brand: row[headers.indexOf('BRAND')] as string,
                mother_brand: row[headers.indexOf('MOTHER BRAND')] as string,
                company_id: companyIdMap.get(companyName),
                company_name: companyName,
                therapy: (row[headers.indexOf('THERAPY')] as string)?.trim(),
                super_group: row[headers.indexOf('SUPER GROUP')] as string,
                sub_supergroup: row[headers.indexOf('SUB SUPERGROUP')] as string,
                group: row[headers.indexOf('GROUP')] as string,
                class: row[headers.indexOf('CLASS')] as string,
                drug_type: row[headers.indexOf('DRUG TYPE')] as string,
                drug_category: row[headers.indexOf('DRUG CATEGORY')] as string,
                subgroup: row[headers.indexOf('SUBGROUP')] as string,
                strength: row[headers.indexOf('STRENGTH')] as string,
                pack: row[headers.indexOf('PACK')] as string,
                pack_unit: row[headers.indexOf('PACK UNIT')] as number,
                schedule: row[headers.indexOf('NLEM 22')] as string,
                is_rx_required: (row[headers.indexOf('NLEM 22')] as string)?.includes('Sch.') || false,
                nlem: row[headers.indexOf('NLEM 22')] as string,
                acute_chronic: row[headers.indexOf('ACUTE/CHRONIC')] as string,
                plain_combination: row[headers.indexOf('PLAIN/COMBINATION')] as string,
                mrp,
                ptr: row[headers.indexOf('PTR')] as number,
                pts: row[headers.indexOf('PTS')] as number,
                brand_launch_date: excelDateToJSDate(row[headers.indexOf('BRAND LAUNCH DATE')] as number),
                sku_launch_date: excelDateToJSDate(row[headers.indexOf('SKU LAUNCH DATE')] as number),
                is_active: true,
            };
        }).filter(Boolean);

        try {
            const result = await Product.insertMany(productDocs, { ordered: false });
            insertedCount += result.length;
        } catch (err: unknown) {
            // Handle duplicate key errors gracefully
            if (err && typeof err === 'object' && 'insertedDocs' in err) {
                insertedCount += (err as { insertedDocs: unknown[] }).insertedDocs.length;
            }
        }

        process.stdout.write(`\r   Progress: ${Math.min(i + BATCH_SIZE, dataRows.length)}/${dataRows.length} rows processed`);
    }

    console.log(`\n✅ Inserted ${insertedCount} products (${skippedCount} skipped)\n`);

    // Create indexes
    console.log('🔍 Creating indexes...');
    await Company.collection.createIndex({ name: 'text', corporate: 'text' });
    await Product.collection.createIndex({ name: 'text', brand: 'text', company_name: 'text', sku: 'text' });
    await Product.collection.createIndex({ company_id: 1 });
    await Product.collection.createIndex({ therapy: 1 });
    await Product.collection.createIndex({ drug_type: 1 });
    await Product.collection.createIndex({ brand: 1 });
    console.log('✅ Indexes created\n');

    // Summary
    const companyCount = await Company.countDocuments();
    const productCount = await Product.countDocuments();

    console.log('═'.repeat(50));
    console.log('📊 Import Summary');
    console.log('═'.repeat(50));
    console.log(`   Companies: ${companyCount}`);
    console.log(`   Products:  ${productCount}`);
    console.log('═'.repeat(50));
    console.log('\n✨ Data import completed successfully!\n');

    await mongoose.disconnect();
}

// Run the import
importData().catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
});
