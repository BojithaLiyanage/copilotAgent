import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

/**
 * This function handles the HTTP POST request for creating a new event for a coach.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<HttpResponseInit>} - A promise that resolves with the HTTP response.
 */
export async function createEvent(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("HTTP POST trigger to create a new event processed a request.");

  // Define the type for the request body based on the provided data structure
  interface EventDetails {
    end_time: string;
    start_time: string;
    is_consented: boolean;
    is_credit_deducted: boolean;
    meeting_id?: number | null;
    reschedule: boolean;
    tripartite_email: string;
  }

  interface UserDetails {
    email: string;
    first_name: string;
    last_name: string;
    medium: string;
    user_comment: string;
    user_time_zone: string;
  }

  interface RequestBody {
    coach_id: number;
    coach_time_zone: string;
    company_id: number;
    event: EventDetails;
    user: UserDetails;
  }

  // Parse the request body
  const body = (await req.json()) as RequestBody;

  // Log the request body to verify the structure
  context.log("Request Body: ", JSON.stringify(body));

  // Validate required fields in the body
  if (!body.coach_id || !body.event || !body.user) {
    return {
      status: 400,
      jsonBody: {
        message:
          "Missing required fields: coach_id, event, and user are required.",
        error: true,
      },
    };
  }

  const backendUrl = "http://localhost:8000/api/coach/calendar/event"; // Your backend endpoint

  // Send POST request to backend API
  let res: HttpResponseInit;
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    const data = await response.json();

    res = {
      status: 200, // Created
      jsonBody: {
        message: "Event created successfully",
        data: data,
      },
    };
  } catch (error) {
    context.log(`Error creating event: ${error.message}`);

    res = {
      status: 500,
      jsonBody: {
        message: "Failed to create event",
        error: true,
      },
    };
  }

  return res;
}

app.http("createEvent", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createEvent,
});
