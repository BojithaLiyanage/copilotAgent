import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

/**
 * This function handles the HTTP request to retrieve events for a coach within a specific date range.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<HttpResponseInit>} - A promise that resolves with the HTTP response containing the coach's events.
 */
export async function getCoachEvents(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    "HTTP trigger function to retrieve coach events processed a request."
  );

  const coachId = req.params.coach_id;
  const startDate = req.query.get("start_date");
  const endDate = req.query.get("end_date");
  const timeZone = req.query.get("time_zone");

  // Validate required parameters
  if (!coachId || !startDate || !endDate || !timeZone) {
    return {
      status: 400,
      jsonBody: {
        message:
          "Missing required parameters: coach_id, start_date, end_date, and time_zone are mandatory",
        error: true,
      },
    };
  }

  const backendUrl = `http://localhost:8000/api/coach/${coachId}/events?start_date=${startDate}&end_date=${endDate}&time_zone=${timeZone}`;

  // Fetch data from the backend endpoint
  let res: HttpResponseInit;
  try {
    const response = await fetch(backendUrl);
    const data = await response.json();

    res = {
      status: response.status,
      jsonBody: {
        message: "Successfully retrieved events",
        error: false,
        data: data || {},
      },
    };
  } catch (error) {
    context.log("Error fetching coach events:", error);
    res = {
      status: 500,
      jsonBody: {
        message: "Failed to retrieve coach events",
        error: true,
        data: {},
      },
    };
  }

  return res;
}

app.http("getCoachEvents", {
  methods: ["GET"],
  route: "coach/{coach_id}/events",
  authLevel: "anonymous",
  handler: getCoachEvents,
});
