/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Replace with a more specific pattern for Unsplash images
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        pathname: "/[a-z0-9]+/[a-z0-9]+/[a-z0-9]+.[a-z]+",
      },
      // Add patterns for other remote domains if needed
      {
        hostname: "plus.unsplash.com",
        pathname: "/[a-z0-9]+/[a-z0-9]+/[a-z0-9]+.[a-z]+",
      },
      {
        hostname: "merakilearn.s3.ap-south-1.amazonaws.com",
        // Optional: Define a pathname pattern if needed
      },
      {
        hostname: "example.com",
        // Optional: Define a pathname pattern if needed
      },
      {
        hostname: "media.istockphoto.com",
        // Optional: Define a pathname pattern if needed
      },
      {
        hostname: "avatar.iran.liara.run",
        // Optional: Define a pathname pattern if needed
      },
      {
        hostname: "placehold.co",
      },
      { hostname: "www.google.com" },
      { hostname: "plus.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;
