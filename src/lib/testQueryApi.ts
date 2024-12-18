import query from "./queryApi";
import admin from "firebase-admin"; // Ensure you have Firebase Admin SDK setup

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const testQueryApi = async () => {
  const prompt = "Write a haiku about programming.";
  const id = "test-id";
  const model = "gpt-3.5-turbo";
  const session = "test-session";

  try {
    // Directly query the model and return the response
    const response = await query(prompt, id, model);

    if (!response) {
      console.error("Failed to get a valid response from ChatGPT.");
      return;
    }

    // Prepare the message object for Firestore
    const message = {
      prompt, // Save the prompt
      response, // Save the entire response object
      createdAt: admin.firestore.Timestamp.now(),
      user: {
        _id: "ChatGPT",
        name: "ChatGPT",
        avatar: "https://res.cloudinary.com/duehd78sl/image/upload/v1729227742/logoLight_amxdpz.png",
      },
    };

    // Save the message to Firestore in a new collection
    const docRef = await admin.firestore()
      .collection("testCollection") // New collection for testing
      .add(message);

    // Log the document ID to verify the write operation
    console.log("Document written with ID: ", docRef.id);

    // Print the response in the terminal
    console.log("Response from ChatGPT:", response);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

// Run the test
testQueryApi();