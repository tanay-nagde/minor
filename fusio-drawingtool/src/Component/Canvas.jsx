import React, { useEffect, useRef, useState, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useParams, useNavigate } from "react-router";

import {
  useGetCanvasByIdQuery,
  useSaveCanvasDataMutation,
} from "../features/canvas/canvasApiSlice";
import { connectSocket, disconnectSocket, emitCanvasUpdate } from "../utils/socketutil";
import { socket } from "../utils/socket";
import {debounce , mergeElements} from "../utils/excalidrawUtils";

export default function Canvas() {
  const { canvasId } = useParams();
  const navigate = useNavigate();

  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(null);

  const [saveCanvas] = useSaveCanvasDataMutation();

  const socketRef = useRef(null);
  socketRef.current = socket;
  const socketIdRef = useRef(null);
  socketIdRef.current = socket.id;
  const initialElementsRef = useRef([]);
  const [elements, setElements] = useState([]);

  const { data: canvasData, isSuccess, isLoading, isError } = useGetCanvasByIdQuery(canvasId);
  
  // Fetch initial data
  useEffect(() => {
    if (isSuccess && canvasData?.data) {
      const fetchedElements = canvasData.data.elements || [];
      initialElementsRef.current = fetchedElements;
      setElements(fetchedElements);
    }
  }, [isSuccess, canvasData]);

 
  // Connect to socket when component mounts
  useEffect(() => {
  if (!canvasId) return;

  connectSocket(canvasId);

 socket.on("canvas-update", ({ senderId, elements: incomingElements }) => {
  if (senderId !== socket.id) {
    console.log("🎨 Received update from another user");
    setElements((prevElements) =>
      mergeElements(prevElements, incomingElements)
    );
  }
});

  return () => {
    disconnectSocket();
    socket.off("canvas-update");
  };
}, [canvasId]); //

   
    

  // Update canvas when elements state changes
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ elements });
     
    }
  }, [elements, excalidrawAPI]);

//  handle change function
 const handleChange = debounce((newElements) => {
  const merged = mergeElements(elements, newElements);

  // Avoid emitting identical states
  if (JSON.stringify(merged) !== JSON.stringify(elements)) {
    setElements(merged);
    emitCanvasUpdate(canvasId, socket.id, merged);
  }
}, 300);


// handle save function
  const handleSave = async () => {
    if (!excalidrawAPI) return;
    const currentElements = excalidrawAPI.getSceneElements();
    try {
      await saveCanvas({ canvasId, data: { elements: currentElements } });
      alert("Canvas saved!");
    } catch (err) {
      console.error("[Save] Failed to save canvas", err);
      alert("Failed to save canvas");
    }
  };

 
  if (isLoading) return <div className="text-white p-4">Loading...</div>;
  if (isError) return <div className="text-red-500 p-4">Failed to load canvas.</div>;

  return (
    <div className="h-full w-full bg-zinc-950 p-4 overflow-hidden rounded-lg shadow-xl flex flex-col">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Save Canvas
        </button>
      </div>

      <div className="flex-grow border border-zinc-800 rounded-md overflow-hidden">
        <Excalidraw
          excalidrawAPI={setExcalidrawAPI}
          onChange={(elements, appState) => handleChange(elements)}
          initialData={{
            elements: initialElementsRef.current,
            scrollToContent: true,
          }}
          isCollaborating={true}
          theme="dark"
        />
      </div>
      
    </div>

  );
}
