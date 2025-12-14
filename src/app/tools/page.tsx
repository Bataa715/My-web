import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";

const tools = [
  {
    title: "Англи хэл",
    description: "Үгсийн сан, дүрмийн дасгал, сорил.",
    href: "/tools/english",
  },
  {
    title: "Япон хэл",
    description: "Хирагана, катакана, үгсийн сан, дүрэм.",
    href: "/tools/japanese",
  },
  {
    title: "Программчлал",
    description: "Үндсэн ойлголтууд, cheat sheets, ахиц хянагч.",
    href: "/tools/programming",
  },
  {
    title: "Pomodoro Timer",
    description: "Хичээллэх, завсарлах хугацааг удирдах.",
    href: "/tools/pomodoro",
    icon: <Timer className="h-6 w-6" />
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Хэрэгслүүд</h1>
        <p className="text-muted-foreground">
          Суралцах үйл явцад тань туслах хэрэгслүүдийн цуглуулга.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.title} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {tool.icon}
                    {tool.title}
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
