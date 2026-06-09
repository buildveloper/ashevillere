import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { BlogPostClient } from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://ashevillere.com/blog/${slug}` },
    openGraph: {
      title: `${post.title} | AshevilleRE`,
      description: post.excerpt,
      url: `https://ashevillere.com/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: `https://ashevillere.com/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.excerpt.slice(0, 100))}&tag=BLOG`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | AshevilleRE`,
      description: post.excerpt,
      images: [`https://ashevillere.com/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.excerpt.slice(0, 100))}&tag=BLOG`],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, 3);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}
