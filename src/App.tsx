import IdeasGraphView from "./components/Network";

export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "radial-gradient(circle at 20% 20%, #1b1b1b, #000 70%)",
      }}
    >
      <IdeasGraphView />
    </div>
  );
}
