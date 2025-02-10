import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Text } from "../ui/text";

interface Props {
  title: string;
  highlights: string[];
}

const InfoCardComponent = ({ title, highlights }: Props) => {
  return (
    <Card className="w-full rounded-lg shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {highlights.map((highlight, index) => (
          <Text key={index}>• {highlight}</Text>
        ))}
      </CardContent>
    </Card>
  );
};

const InfoCard = React.memo(InfoCardComponent);
InfoCard.displayName = "InfoCard";

export default InfoCard;
