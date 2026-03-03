const formatDate = (dt: string) => {
  const d = new Date(dt);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dt: string) => {
  const d = new Date(dt);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export { formatDate, formatTime };
