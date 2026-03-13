import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 },
    );
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, title, description } = body;

  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description: description ?? null,
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

