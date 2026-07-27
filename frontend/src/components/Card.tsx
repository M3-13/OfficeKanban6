interface CardProps {
  card: {
    id: number;
    title: string;
    description: string;
    position: number;
    column_id: number;
    user_id: number;
  };
}

function Card({ card }: CardProps) {
  return <div>{card.title}</div>;
}

export default Card;
