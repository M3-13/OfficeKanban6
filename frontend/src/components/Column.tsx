interface ColumnProps {
  column: {
    id: number;
    title: string;
    position: number;
    user_id: number;
  };
}

function Column({ column }: ColumnProps) {
  return <div>{column.title}</div>;
}

export default Column;
