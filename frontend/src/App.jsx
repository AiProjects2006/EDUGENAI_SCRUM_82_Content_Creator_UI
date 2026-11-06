import { CreatorAuthProvider } from "./context/CreatorAuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <CreatorAuthProvider>
            <AppRoutes />
        </CreatorAuthProvider>
    );
}

export default App;
