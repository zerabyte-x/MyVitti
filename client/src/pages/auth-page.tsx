import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  
  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
    defaultValues: { username: "", password: "" }
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "", preferredLanguage: "en" }
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to MyVitti</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(data => loginMutation.mutate(data))} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input {...loginForm.register("username")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input type="password" {...loginForm.register("password")} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(data => registerMutation.mutate(data))} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input {...registerForm.register("username")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input type="password" {...registerForm.register("password")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage">Preferred Language</Label>
                      <select
                        {...registerForm.register("preferredLanguage")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="ta">தமிழ்</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-8 bg-slate-50">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI-Powered Learning Platform
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Join MyVitti to experience personalized AI tutoring, multilingual support, and interactive learning tools.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Smart Tutoring</h3>
              <p className="text-sm text-gray-600">Get instant help with our AI tutor in multiple languages</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">File Analysis</h3>
              <p className="text-sm text-gray-600">Upload documents for AI-powered analysis and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}