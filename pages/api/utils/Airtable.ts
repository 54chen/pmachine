import Airtable from 'airtable';
Airtable.configure({
    "apiKey": process.env.AIRTABLE_API_KEY,
});
 
const base = Airtable.base(process.env.AIRTABLE_BASE_ID as string);
const table = base(process.env.AIRTABLE_TABLE_NAME as string);
const table2 = base(process.env.AIRTABLE_TABLE_NAME2 as string);

export { table };
export { table2 };