import { NextResponse } from 'next/server';
import { TableClient } from '@azure/data-tables';

const tableClient =  TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
    process.env.AZURE_TABLE_NAME!,
)

export async function GET() {
    try{
        const jobs = [];
        const entities = await tableClient.listEntities({
            queryOptions:{filter: "PartitionKey eq 'jobs'"}
        })

        for await (const entity of entities){
            jobs.push({
                rowKey:entity.rowKey,
                title:entity.title ?? "",
                description:entity.description ?? "",
                requirements:entity.requirements ?? ""
            })
        }

        return NextResponse.json(jobs);
    }
    catch(err){
        console.error("error in fetching jobs: " , err)
        return NextResponse.json(
            {error:"failed to fetch jobs"},
            {status:500},
        )
    }
}

