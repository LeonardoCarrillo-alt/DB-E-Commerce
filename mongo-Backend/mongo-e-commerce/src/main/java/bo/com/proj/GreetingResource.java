package bo.com.proj;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import java.net.URI;

@Path("/")
public class GreetingResource {

    @GET
    @Path("/hello")
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello from Quarkus REST";
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    public Response root(@Context UriInfo uriInfo) {
        URI swaggerUri = uriInfo.getBaseUriBuilder().path("q").path("swagger-ui").build();
        return Response.temporaryRedirect(swaggerUri).build();
    }
}
