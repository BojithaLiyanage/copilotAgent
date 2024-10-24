import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

/**
 * This function handles the HTTP request and retrieves a coach's details by ID.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<HttpResponseInit>} - A promise that resolves with the HTTP response containing coach data.
 */
export async function getCoachDetails(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    "HTTP trigger function to retrieve coach details processed a request."
  );

  const coachId = req.params.id;

  if (!coachId) {
    return {
      status: 400,
      jsonBody: {
        message: "Coach ID is required",
        error: true,
      },
    };
  }

  const backendUrl = `http://localhost:8000/api/coach/${coachId}`;

  // Fetch data from the backend endpoint
  let res: HttpResponseInit;
  try {
    const response = await fetch(backendUrl);
    const data = await response.json();

    res = {
      status: response.status,
      jsonBody: {
        message: data.message || "Successfully retrieved coach details",
        error: data.error || false,
        data: data.data || {},
      },
    };
  } catch (error) {
    context.log("Error fetching coach details:", error);
    res = {
      status: 500,
      jsonBody: {
        message: "Failed to retrieve coach details",
        error: true,
        data: {},
      },
    };
  }

  return res;
}

app.http("getCoachDetails", {
  methods: ["GET"],
  route: "coach/{id}",
  authLevel: "anonymous",
  handler: getCoachDetails,
});
