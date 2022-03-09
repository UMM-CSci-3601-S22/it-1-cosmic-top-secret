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

@SuppressWarnings({ "MagicNumber" })
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

  @Test
  public void canGetPerishableProducts() throws IOException {
    mockReq.setQueryString("tags=perishable");
    Context ctx = mockContext("api/pantry");

    pantryController.getPantry(ctx);
    Pantry[] resultPantry = returnedPantry(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(3, resultPantry.length);

    for (Pantry pantry: resultPantry) {
      assertTrue(pantry.tags.indexOf("perishable") >= 0);
    }
  }

  @Test
  public void respondsCorrectlyToInvalidTag() {
    mockReq.setQueryString("tags=chewy");
    Context ctx = mockContext("api/pantry");

    pantryController.getPantry(ctx);
    Pantry[] resultPantry = returnedPantry(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(0, resultPantry.length);
  }

  @Test
  public void getPantryProductWithExistingId() throws IOException {
    String testID = butterId.toHexString();
    Context ctx = mockContext("api/pantry/{id}", Map.of("id", testID));

    pantryController.getOnePantryInput(ctx);
    Pantry resultPantry = returnedSinglePantry(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(butterId.toHexString(), resultPantry._id);
    assertEquals("2022-09-21", resultPantry.purchaseDate);
  }

  @Test
  public void getPantryProductWithBadId() throws IOException {
    Context ctx = mockContext("/api/pantry/{id}", Map.of("id", "bad"));
    assertThrows(NotFoundResponse.class, () -> {
      pantryController.getOnePantryInput(ctx);
    });
  }

  @Test
  public void getPantyProductWithNonExistentId() throws IOException {
    Context ctx = mockContext("/api/pantry/{id}", Map.of("id", "58af3a600343927e48e87335"));
    assertThrows(NotFoundResponse.class, () -> {
      pantryController.getOnePantryInput(ctx);
    });
  }

  @Test
  public void addPantryProduct() throws IOException {

    String testNewPantryProduct = "{"
    + "\"purchaseDate\": \"TestDate\","
    + "\"tags\":[\"perishable\",\"exists\",\"test\"],"
    + "\"notes\": \"Test Notes\""
    + "}";
    mockReq.setBodyContent(testNewPantryProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/pantry");

    pantryController.addNewPantryProduct(ctx);
    String result = ctx.resultString();
    String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

    assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

    assertNotEquals("", id);
    assertEquals(1, db.getCollection("pantry").countDocuments(eq("_id", new ObjectId(id))));

    Document addedPantryProduct = db.getCollection("pantry").find(eq("_id", new ObjectId(id))).first();

    assertNotNull(addedPantryProduct);
    assertEquals("TestDate", addedPantryProduct.getString("purchaseDate"));
    assertEquals("perishable", addedPantryProduct.getList("tags", String.class).get(0));
    assertEquals("Test Notes", addedPantryProduct.getString("notes"));
  }

  @Test
  public void deleteProduct() throws IOException {
    String testID = butterId.toHexString();

    assertEquals(1, db.getCollection("pantry").countDocuments(eq("_id", new ObjectId(testID))));

    Context ctx = mockContext("api/pantry/{id}", Map.of("id", testID));

    pantryController.deletePantryProduct(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());

    // Pantry Product is no longer in the database
    assertEquals(0, db.getCollection("pantry").countDocuments(eq("_id", new ObjectId(testID))));
  }
}
