import { Button } from "@heroui/react";

export function Friends() {
  const friends = [
    { name: "Andrei Boghean", url: "https://andreiboghean.com/" },
    { name: "Andrei Ghiță", url: "https://andreig.dev/" },
    { name: "Benjamin Parsons-Willis", url: "https://vyrz.dev/" },
    { name: "Fraser Miller", url: "https://frasermiller.dev/" },
    { name: "Luke Ormiston", url: "https://lukeormiston.com/" },
    { name: "Mark Turnbull", url: "https://mrktrnbll.dev/" },
    { name: "Nour Elfangary", url: "https://nourelfangary.com/" },
    { name: "Stefan Vučković", url: "https://stefvuck.dev/" },
  ];

  return (
    <section
      className="grid gap-4 button-grid"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        marginBottom: "1rem",
      }}
    >
      {friends.map((friend) => (
        <Button
          key={friend.name}
          as="a"
          href={friend.url}
          target="_blank"
          rel="noopener noreferrer"
          color="primary"
          variant="shadow"
          size="lg"
        >
          {friend.name}
        </Button>
      ))}
    </section>
  );
}
