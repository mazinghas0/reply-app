export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  readingTime: string;
  sections: Array<{
    heading: string;
    content: string;
    example?: { received: string; replies: string[] };
  }>;
}
