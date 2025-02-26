import { useAuth } from "@/hooks/use-auth";
import { Button as OriginalButton } from "@/components/ui/button";
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
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";

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
    <PageTransition>
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex items-center justify-center p-8">
          <AnimatedCard className="w-full max-w-md">
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
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="username">Username</Label>
                        <Input {...loginForm.register("username")} />
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" {...loginForm.register("password")} />
                      </motion.div>
                      <AnimatedButton type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Login"
                        )}
                      </AnimatedButton>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(data => registerMutation.mutate(data))} className="space-y-4">
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="username">Username</Label>
                        <Input {...registerForm.register("username")} />
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="password">Password</Label>
                        <Input type="password" {...registerForm.register("password")} />
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Label htmlFor="preferredLanguage">Preferred Language</Label>
                        <select
                          {...registerForm.register("preferredLanguage")}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी</option>
                          <option value="ta">தமிழ்</option>
                        </select>
                      </motion.div>
                      <AnimatedButton type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Register"
                        )}
                      </AnimatedButton>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </AnimatedCard>
        </div>

        <motion.div 
          className="hidden lg:flex flex-col justify-center p-8 bg-slate-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-lg mx-auto">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI-Powered Learning Platform
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Join MyVitti to experience personalized AI tutoring, multilingual support, and interactive learning tools.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <AnimatedCard className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Smart Tutoring</h3>
                <p className="text-sm text-gray-600">Get instant help with our AI tutor in multiple languages</p>
              </AnimatedCard>
              <AnimatedCard className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">File Analysis</h3>
                <p className="text-sm text-gray-600">Upload documents for AI-powered analysis and insights</p>
              </AnimatedCard>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}