import { Button } from "@/components/ui/button"
import { Github, Rocket, ShieldCheck, Server, LayoutGrid } from "lucide-react"
import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground px-6 py-16">
      {/* Hero Section */}
      <div className="text-center max-w-2xl space-y-6">
        <div className="flex justify-center">
          <Rocket className="h-12 w-12 text-[hsl(var(--ring))]" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Create smarter surveys, beautifully.
        </h1>
        <p className="text-lg text-muted-foreground">
          Powerful tools for teams to gather insights, collaborate, and act—fast.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
          </Link>
          <Link to="https://github.com/your-org/survey-tool" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-20 max-w-5xl w-full grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
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
  )
}
