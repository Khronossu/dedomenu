import { NextRequest, NextResponse } from "next/server";
import query from "@/src/lib/queryApi";
import { adminDB } from "@/firabaseAdmin"; // Replace with your correct path
import admin from "firebase-admin";

// Ensure Firebase Admin SDK is initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export const POST = async (req: NextRequest) => {
  try {
    const reqBody = await req.json();
    const { prompt, id, model, session } = reqBody;

    console.log("Received payload:", reqBody);

    // Validate required fields
    if (!prompt || !id || !model || !session) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Query OpenAI API
    const response = await query(prompt, id, model);

    // Log the full response
    console.log("Response from OpenAI API:", JSON.stringify(response, null, 2));

    // Ensure response structure is valid
    if (
      !response ||
      !response.choices ||
      !response.choices[0] ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      throw new Error("Invalid response structure from OpenAI API.");
    }

    // Prepare the message object
    const message = {
      text: response.choices[0].message.content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      user: {
        _id: "ChatGPT",
        name: "ChatGPT",
        avatar:
          "https://res.cloudinary.com/duehd78sl/image/upload/v1729227742/logoLight_amxdpz.png",
      },
    };

    // Save the message to Firestore
    console.log("Saving message to Firestore:", message);
    await adminDB
      .collection("users")
      .doc(session)
      .collection("chats")
      .doc(id)
      .collection("messages")
      .add(message);
    console.log("Message saved to Firestore");

    // Return the response
    return NextResponse.json(
      {
        answer: message.text,
        message: "ChatGPT has responded.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
};