package umm3601.pantry;


import static com.mongodb.client.model.Filters.eq;
import static io.javalin.plugin.json.JsonMapperKt.JSON_MAPPER_KEY;
import static java.util.Map.entry;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;

import com.mongodb.ServerAddress;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.plugin.json.JavalinJackson;

import java.net.HttpURLConnection;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import io.javalin.core.JavalinConfig;
import io.javalin.core.validation.ValidationException;
import io.javalin.http.Context;
import io.javalin.http.HandlerType;
import io.javalin.http.util.ContextUtil;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;

/*
 * Tests the logic of PantryController
 *
 * @throws IOException
 */

@SuppressWarnings({ "Magic Number" })
public class PantryControllerSpec {
  private MockHttpServletRequest mockReq = new MockHttpServletRequest();
  private MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private PantryController pantryController;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  private static JavalinJackson javalinJackson = new JavalinJackson();
  private ObjectId butterId;

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build()
     );
     db = mongoClient.getDatabase("test");
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  public void setupEach() throws IOException {
    mockReq.resetAll();
    mockRes.resetAll();

    MongoCollection<Document> pantryDocuments = db.getCollection("pantry");
    pantryDocuments.drop();
    List<Document> testPantry = new ArrayList<>();
    testPantry.add(
      new Document()
      .append("purchaseDate", "2022-09-21")
      .append("tags",
      new ArrayList<String>(
        Arrays.asList(new String[] {
          "produce",
          "bulk",
          "perishable"
      })))
      .append("notes", "This product is rotten two weeks after purchase")
    );
    testPantry.add(
      new Document()
      .append("purchaseDate", "2021-07-06")
      .append("tags",
      new ArrayList<String>(
        Arrays.asList(new String[] {
          "bottled",
          "drink"
      })))
      .append("notes", "Do not leave this in the cabinet after opening")
    );
    testPantry.add(
      new Document()
      .append("purchaseDate", "2022-09-21")
      .append("tags",
      new ArrayList<String>(
        Arrays.asList(new String[] {
          "produce",
          "bulk",
          "perishable"
      })))
      .append("notes", "Remember to check for a toy at the bottom of the box")
    );

    butterId = new ObjectId();
    Document butter = new Document()
      .append("_id", butterId)
      .append("purchaseDate", "2022-09-21")
      .append("tags",
      new ArrayList<String>(
        Arrays.asList(new String[] {
          "dairy",
          "bulk",
          "perishable"
      })))
      .append("notes", "Remember to check for a toy at the bottom of the box"
    );

    pantryDocuments.insertOne(butter);
    pantryDocuments.insertMany(testPantry);
    pantryController = new PantryController(db);
  }

  private Context mockContext(String path) {
    return mockContext(path, Collections.emptyMap());
  }

  private Context mockContext(String path, Map<String, String> pathParams) {
    return io.javalin.http.util.ContextUtil.init(
      mockReq, mockRes,
      path,
      pathParams,
      HandlerType.INVALID,
      Map.ofEntries(
        entry(JSON_MAPPER_KEY, javalinJackson),
        entry(ContextUtil.maxRequestSizeKey,
          new JavalinConfig().maxRequestSize
        )
      )
    );
  }

  private Pantry[] returnedPantry(Context ctx) {
    String result = ctx.resultString();
    Pantry[] pantry = javalinJackson.fromJsonString(result, Pantry[].class);
    return pantry;
  }

  private Pantry returnedSinglePantry(Context ctx) {
    String result = ctx.resultString();
    Pantry pantry = javalinJackson.fromJsonString(result, Pantry.class);
    return pantry;
  }

  @Test
  public void canGetAllOfPantry() throws IOException {
    String path = "api/pantry";
    Context ctx = mockContext(path);

    pantryController.getPantry(ctx);
    Pantry[] returnedPantry = returnedPantry(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(
      db.getCollection("pantry").countDocuments(),
      returnedPantry.length
    );
  }
}
