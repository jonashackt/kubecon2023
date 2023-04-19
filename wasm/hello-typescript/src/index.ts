import { HandleRequest, HttpRequest, HttpResponse} from "@fermyon/spin-sdk"

const encoder = new TextEncoder()

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
    return {
      status: 200,
        headers: { "foo": "bar" },
      body: encoder.encode("Hello from KubeCon at Home :)").buffer
    }
}
