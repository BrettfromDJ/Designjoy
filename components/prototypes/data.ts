import { codedWork, type WorkItem } from "@/content/site";
import { getFaqs } from "@/lib/faqs";
import { getProjects } from "@/lib/projects";

/** Everything the prototypes show: the work (coded pieces first, as on the
 *  homepage) and the FAQs. */
export async function getPrototypeData() {
  const [projects, { faqs }] = await Promise.all([getProjects(), getFaqs()]);
  const uploaded: WorkItem[] = projects.map(({ id, title, company, kind, url, width, height, frames }) => ({
    id,
    title,
    company,
    kind,
    src: url,
    width,
    height,
    ...(kind === "image" && frames?.length ? { frames } : {}),
  }));
  return { work: [...codedWork, ...uploaded], faqs };
}

/** FAQ answers carry next-step tags like [plans] for the chatbot; not shown here. */
export const plain = (answer: string) => answer.replace(/\s*\[[a-z-]+\]/g, "").trim();
