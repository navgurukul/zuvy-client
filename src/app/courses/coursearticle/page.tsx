import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <article className='max-w-2xl mx-auto my-8 p-4'>
      <h1 className='text-3xl font-bold mb-4 flex flex-start'>
        What are constants ?
      </h1>
      <img
        src='https://images.unsplash.com/photo-1643116774075-acc00caa9a7b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        alt='Blog Post Image'
        className='w-full h-auto mb-4'
      />
      <p className='text-lg mb-4'>
        When you will move forward in this course, you will find examples of
        python code in different ways. You have to run these examples on python
        shell.
      </p>
      <p className='text-lg mb-4'>
        Vestibulum efficitur augue ut tristique hendrerit. Aenean auctor velit
        id justo hendrerit congue. Sed auctor mi id dui dictum, a fringilla odio
        maximus.
      </p>
      <p className='text-lg mb-4'>
        Integer consectetur risus vel nisi volutpat, ut semper arcu lacinia. Sed
        ut dui vel libero luctus tristique a vel velit.
      </p>
      {/* Add more content as needed */}
    </article>
  );
}
