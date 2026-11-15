#!/bin/sh
cat > /app/index.html <<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pipeline smoke test</title>
</head>
<body>
  <main>
    <h1>Pipeline smoke test</h1>
    <p>This minimal page confirms that the Harbor task can run an agent, write its single HTML deliverable, and pass it to the render verifier. It intentionally contains no reference design or scenario-specific answer, and provides enough readable content for the current nonblank render gate.</p>
  </main>
</body>
</html>
HTML
