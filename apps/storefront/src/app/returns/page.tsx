import { returnsPolicy } from "@linq/site-config";
import { PolicyPage } from "@/components/policy-page";

export const metadata = {
  title: returnsPolicy.title,
  description: returnsPolicy.intro,
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      title={returnsPolicy.title}
      intro={returnsPolicy.intro}
      sections={[...returnsPolicy.sections]}
    />
  );
}
