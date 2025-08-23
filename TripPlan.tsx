<Card key={day.id}>
  <img src={day.img} alt={day.title} />
  <CardContent>
    <h3>{day.title}</h3>
    <p>{day.summary}</p>
    <Button asChild>
      <a href={day.link} target="_blank">View Spot</a>
    </Button>
  </CardContent>
</Card>
