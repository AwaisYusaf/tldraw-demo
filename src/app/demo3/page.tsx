"use client";
import React from "react";
import dynamic from "next/dynamic";

const BindingsDemo = dynamic(() => import("./_components/BindingsDemo"), {
  ssr: false,
});

export default function Demo2Page() {
  return <BindingsDemo />;
}
