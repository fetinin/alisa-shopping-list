import dotenv from 'dotenv';

import { Client } from '@notionhq/client';

dotenv.config();

if (!process.env.NOTION_TOKEN) throw "NOTION_TOKEN is required";
if (!process.env.NOTION_DB_ID) throw "NOTION_DB_ID is required";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;

export async function handler(
  event: { version: string; session: any; request: any },
  _: Object
) {
  const { version, session, request } = event;

  if (!request["original_utterance"]) {
    return {
      version,
      session,
      response: {
        text: "Привет! Что добавить в список?",
        end_session: false,
      },
    };
  }

  const userPhrase = capitalizeFirstLetter(
    request["original_utterance"]
      .toLowerCase()
      .replace("добавь", "")
      .replace("добавить", "")
      .trim()
  );
  const items = userPhrase.split(" и ");

  for (const itemName of items) {
    await addToShoppingList(itemName);
  }

  return {
    version,
    session,
    response: {
      text: `Лады, добавила ${items.join(", ")} в список покупок.`,
      end_session: true,
    },
  };
}

async function addToShoppingList(name: string) {
  const notion = new Client({ auth: NOTION_TOKEN });

  await notion.pages.create({
    parent: { database_id: NOTION_DB_ID },
    properties: {
      Name: {
        type: "title",
        title: [{ type: "text", text: { content: name } }],
      },
    },
  });
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
