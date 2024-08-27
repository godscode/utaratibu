// import path from "path";
import { promises as fsp } from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoClient } from "mongodb";
import pdfParse from "pdf-parse";
// import { Document, Packer, Paragraph } from "docx";
// import mammoth from "mammoth";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const dbName = "docs";
const collectionName = "embeddings";
const collection = client.db(dbName).collection(collectionName);

const docs_dir = "_assets/gods_docs";

const fileNames = await fsp.readdir(docs_dir);
console.log(fileNames); 

// for (const fileName of fileNames) {
//   const document = await fsp.readFile(`${docs_dir}/${fileName}`, "utf8");

  for (const fileName of fileNames) {
      const filePath = path.join(docs_dir, fileName);
      const ext = path.extname(fileName).toLowerCase();
  
      let document = "";
        // Read .pdf files
        const pdfBuffer = await fsp.readFile(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        document = pdfData.text;

  console.log(document);

  console.log(`Vectorizing ${fileName}`);
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const output = await splitter.createDocuments([document]);

  await MongoDBAtlasVectorSearch.fromDocuments(output, new OpenAIEmbeddings(), {
    collection,
    indexName: "default",
    textKey: "text",
    embeddingKey: "embedding",
  });
}

// console.log('Current working directory:', process.cwd());

console.log("Done: Closing Connection");
await client.close();


// import path from "path";
// import { promises as fsp } from "fs";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { MongoClient } from "mongodb";
// import pdfParse from "pdf-parse";
// import "dotenv/config";

// const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
// const dbName = "docs";
// const collectionName = "embeddings";
// const collection = client.db(dbName).collection(collectionName);

// const docs_dir = "_assets/gods_docs";

// async function processFiles() {
//     try {
//         const fileNames = await fsp.readdir(docs_dir);
//         console.log(fileNames);

//         for (const fileName of fileNames) {
//             const filePath = path.join(docs_dir, fileName);
//             const ext = path.extname(fileName).toLowerCase();

//             let document = "";

//             // Check if the file exists
//             try {
//                 await fsp.access(filePath);
//             } catch (error) {
//                 console.error(`File not found: ${filePath}`);
//                 continue; // Skip to the next file if this one doesn't exist
//             }

//             // Read the file based on its extension
//             if (ext === ".pdf") {
//                 const pdfBuffer = await fsp.readFile(filePath);
//                 const pdfData = await pdfParse(pdfBuffer);
//                 document = pdfData.text;
//             } else {
//                 console.log(`Unsupported file type: ${fileName}`);
//                 continue;
//             }

//             console.log(document);

//             console.log(`Vectorizing ${fileName}`);
//             const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
//                 chunkSize: 500,
//                 chunkOverlap: 50,
//             });
//             const output = await splitter.createDocuments([document]);

//             await MongoDBAtlasVectorSearch.fromDocuments(output, new OpenAIEmbeddings(), {
//                 collection,
//                 indexName: "default",
//                 textKey: "text",
//                 embeddingKey: "embedding",
//             });
//         }

//         console.log("Done: Closing Connection");
//     } catch (error) {
//         console.error("Error processing files:", error);
//     } finally {
//         await client.close();
//     }
// }

// processFiles();
