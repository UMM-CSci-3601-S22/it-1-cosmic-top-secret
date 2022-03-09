package umm3601.product;


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
/**
 * Tests the logic of the ProductController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.

@SuppressWarnings({ "MagicNumber" })
public class ProductControllerSpec {
  private MockHttpServletRequest mockReq = new MockHttpServletRequest();
  private MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private ProductController productController;

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

    MongoCollection<Document> productDocuments = db.getCollection("products");
    productDocuments.drop();
    List<Document> testProducts = new ArrayList<>();
    testProducts.add(
      new Document()
      .append("productName", "apples")
      .append("threshold", 4)
      .append("tags",
      new ArrayList<String>(
        Arrays.asList(new String[] {
          "produce",
          "bulk",
          "perishable"
        })))
    );
    testProducts.add(
      new Document()
      .append("productName", "bananas")
      .append("threshold", 2)
      .append("tags",
      new ArrayList<String>(
        Arrays.asList(new String[] {
          "produce",
          "fruit",
          "perishable"
        })))
    );
    testProducts.add(
      new Document()
      .append("productName", "Cereal")
      .append("threshold", 1)
      .append("tags",
      new ArrayList<String>(Arrays.asList(new String[] {
        "nonperishable",
        "grains",
        "boxed"
      })))
    );

    butterId = new ObjectId();
    Document butter = new Document()
      .append("_id", butterId)
      .append("productName", "Butter")
      .append("threshold", 4)
      .append("tags",
      new ArrayList<String>(Arrays.asList(new String[] {
        "dairy",
        "refrigerated",
      }))
    );

    productDocuments.insertOne(butter);
    productDocuments.insertMany(testProducts);
    productController = new ProductController(db);
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

  private Product[] returnedProducts(Context ctx) {
    String result = ctx.resultString();
    Product[] products = javalinJackson.fromJsonString(result, Product[].class);
    return products;
  }

  private Product returnedSingleProduct(Context ctx) {
    String result = ctx.resultString();
    Product product = javalinJackson.fromJsonString(result, Product.class);
    return product;
  }

  @Test
  public void canGetAllProducts() throws IOException {
    String path = "api/products";
    Context ctx = mockContext(path);

    productController.getProducts(ctx);
    Product[] returnedProducts = returnedProducts(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(
      db.getCollection("products").countDocuments(),
      returnedProducts.length
    );
  }

  @Test
  public void canGetProduceProducts() throws IOException {
    mockReq.setQueryString("tags=produce");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(2, resultProducts.length);

    for (Product product: resultProducts) {
      assertTrue(product.tags.indexOf("produce") >= 0);
    }
  }

  @Test
  public void respondsCorrectlyToInvalidTag() {
    //An invalid tag is not going to match any entries, so we expect
    // no returned products.
    //this tag does not exist anywhere in the database
    mockReq.setQueryString("tags=foo");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(0, resultProducts.length);
  }

  @Test
  public void canGetApples() throws IOException {
    mockReq.setQueryString("productName=apples");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(1, resultProducts.length);

    for (Product product: resultProducts) {
      assertEquals("apples", product.productName);
    }
  }

  @Test
  public void getProductWithExistentId() throws IOException {
    String testID = butterId.toHexString();
    Context ctx = mockContext("api/products/{id}", Map.of("id", testID));

    productController.getProduct(ctx);
    Product resultProduct = returnedSingleProduct(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(butterId.toHexString(), resultProduct._id);
    assertEquals("Butter", resultProduct.productName);
  }

  @Test
  public void getProductWithBadId() throws IOException {
    Context ctx = mockContext("/api/products/{id}", Map.of("id", "bad"));
    assertThrows(NotFoundResponse.class, () -> {
      productController.getProduct(ctx);
    });
  }

  @Test
  public void getProductWithNonExistentId() throws IOException {
    Context ctx = mockContext("/api/products/{id}", Map.of("id", "58af3a600343927e48e87335"));
    assertThrows(NotFoundResponse.class, () -> {
      productController.getProduct(ctx);
    });
  }

  @Test
  public void addProduct() throws IOException {

    String testNewProduct = "{"
    + "\"productName\": \"TestProduct\","
    + "\"threshold\": 4,"
    + "\"tags\":[\"perishable\",\"exists\",\"test\"]"
    + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    productController.addNewProduct(ctx);
    String result = ctx.resultString();
    String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

    assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

    assertNotEquals("", id);
    assertEquals(1, db.getCollection("products").countDocuments(eq("_id", new ObjectId(id))));

    Document addedProduct = db.getCollection("products").find(eq("_id", new ObjectId(id))).first();

    assertNotNull(addedProduct);
    assertEquals("TestProduct", addedProduct.getString("productName"));
    assertEquals(4, addedProduct.getInteger("threshold"));
    assertEquals("perishable", addedProduct.getList("tags", String.class).get(0));

  }
}
