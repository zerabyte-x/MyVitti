import { useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { supportedLanguages } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const languageNames = {
  en: "English",
  hi: "हिंदी",
  ta: "தமிழ்"
};

export default function LanguageSelector() {
  const { user } = useAuth();

  const languageMutation = useMutation({
    mutationFn: async (language: string) => {
      const res = await apiRequest("PATCH", `/api/user/language`, { language });
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
    }
  });

  return (
    <Select
      value={user?.preferredLanguage}
      onValueChange={(value) => languageMutation.mutate(value)}
      disabled={languageMutation.isPending}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageNames[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
