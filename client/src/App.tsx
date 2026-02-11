import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FamilySettings from "./pages/FamilySettings";
import MealPatterns from "./pages/MealPatterns";
import WeeklyMenu from "./pages/WeeklyMenu";
import ShoppingList from "./pages/ShoppingList";
import RecipeDetail from "./pages/RecipeDetail";
import PatternSelection from "./pages/PatternSelection";
import SetupWizard from "./pages/SetupWizard";
import InventoryManagement from "./pages/InventoryManagement";
import RecipeRecommendation from "./pages/RecipeRecommendation";
import { RecipeGenerator } from "./pages/RecipeGenerator";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/family"} component={FamilySettings} />
      <Route path={"/meal-patterns"} component={MealPatterns} />
      <Route path={"/menu"} component={WeeklyMenu} />
      <Route path={"/shopping"} component={ShoppingList} />
      <Route path={"/recipe/:id"} component={RecipeDetail} />
      <Route path={"/patterns"} component={PatternSelection} />
      <Route path={"/setup"} component={SetupWizard} />
      <Route path={"/inventory"} component={InventoryManagement} />
      <Route path={"/recommendations"} component={RecipeRecommendation} />
      <Route path={"/recipe-generator"} component={RecipeGenerator} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
