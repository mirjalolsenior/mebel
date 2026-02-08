export default async () => {
  return new Response("ok", { status: 200 });
};

export const config = {
  schedule: "*/5 * * * *"
};
