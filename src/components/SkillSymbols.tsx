"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { skillGroups } from "@/lib/portfolio-data";
import { SiBootstrap, SiCss, SiDocker, SiExpress, SiGit, SiGithub, SiHtml5, SiJavascript, SiLinux, SiMongodb, SiMysql, SiNextdotjs, SiNodedotjs, SiPostgresql, SiPrisma, SiReact, SiSpringboot, SiTailwindcss, SiTypescript } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { Cloud, Code2, Database, Network, Workflow } from "lucide-react";
import type { ComponentType } from "react";

const icons: Record<string, ComponentType<{ size?: number }>> = {
  Java: FaJava, JavaScript: SiJavascript, HTML: SiHtml5, HTML5: SiHtml5, CSS: SiCss,
  React: SiReact, "React.js": SiReact, "Next.js": SiNextdotjs, "Node.js": SiNodedotjs,
  "Express.js": SiExpress, "Spring Boot": SiSpringboot, Bootstrap: SiBootstrap,
  "Tailwind CSS": SiTailwindcss, MongoDB: SiMongodb, "PostgreSQL (Prisma)": SiPostgresql,
  PostgreSQL: SiPostgresql, MySQL: SiMysql, Linux: SiLinux, AWS: Cloud,
  Git: SiGit, GitHub: SiGithub, TypeScript: SiTypescript, Prisma: SiPrisma,
  Docker: SiDocker, "Object-Oriented Programming": Code2,
  "Data Structures & Algorithms": Workflow, "Operating Systems": Cloud,
  "Computer Networks": Network, DBMS: Database,
};

export function SkillSymbols() {
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="skills-grid">
    {skillGroups.map(([group, items]) => <div className="skill-card" key={group}>
      <span className="number mono">{group}</span>
      <div className="skill-symbols">
        {items.map((item) => {
          const Icon = icons[item] ?? Code2;
          return <Button key={item} type="button" variant="ghost" className="skill-symbol" aria-label={item} aria-pressed={selected === item} title={item} onClick={() => setSelected(item)}>
            <Icon size={31} />
          </Button>;
        })}
      </div>
      <p className="skill-selected mono" aria-live="polite">{selected && items.some((item) => item === selected) ? selected : "\u00a0"}</p>
    </div>)}
  </div>;
}