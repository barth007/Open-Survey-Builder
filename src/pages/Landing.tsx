import { Button } from "@/components/ui/button"
import { Github, Rocket, ShieldCheck, Server, LayoutGrid } from "lucide-react"
import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-16 w-full">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="flex justify-center">
            <Rocket className="h-12 w-12 text-[hsl(var(--ring))]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Run Research on your terms.
          </h1>
          <p className="text-lg text-muted-foreground">
            Keep your data private, collaborate with your team, and get the insights you need—without giving up control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto flex items-center gap-2"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "Host It Where You Want",
              desc: "Deploy on-premise or in your private cloud. Your data, your infrastructure, your rules.",
              icon: Server,
            },
            {
              title: "Collaborate Securely",
              desc: "Built for teams. Control access, protect privacy, and work together with confidence.",
              icon: ShieldCheck,
            },
            {
              title: "Everything You Expect—Unified",
              desc: "Conditional logic, branching, analytics, themes—everything from leading tools, finally in one place.",
              icon: LayoutGrid,
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="p-6 rounded-lg bg-card shadow-sm border border-border">
                <div className="flex items-center space-x-3 mb-4 text-primary">
                  <Icon className="h-6 w-6" />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
