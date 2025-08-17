import { NextRequest, NextResponse } from "next/server";
import { v0 } from "v0-sdk";

export async function POST(request: NextRequest) {
  try {
    const { message, chatId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let chat;

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId,
        message,
      });
    } else {
      // create new chat
      const project = await v0.projects.create({
        name: "My Project",
        environmentVariables: [
          {
            key: "V0_API_KEY",
            value: process.env.V0_API_KEY ?? "",
          },
        ],
      });

      chat = await v0.chats.init({
        type: "repo",
        repo: {
          url: "https://github.com/Speediing/vibe-code-example",
          branch: "main",
        },
      });
      const result = await v0.projects.assign({
        projectId: project.id,
        chatId: chat.id,
      });
      chat = await v0.chats.create({
        message,
      });
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
    });
  } catch (error) {
    console.error("V0 API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
