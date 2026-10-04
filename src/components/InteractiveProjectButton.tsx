import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InteractiveProjectButton({ id, label = "View project" }: { id: string; label?: string }) {
  return <Button asChild variant="outline" className="interactive-project-button">
    <Link to="/projects/$id" params={{ id }}>
      <span className="interactive-project-button-label">{label}</span>
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  </Button>;
}