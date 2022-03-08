package umm3601.product;

import static io.javalin.plugin.json.JsonMapperKt.JSON_MAPPER_KEY;
import static java.util.Map.entry;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;

import com.mongodb.ServerAddress;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.plugin.json.JavalinJackson;

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

import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;

import java.util.logging.Logger;
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

  private final static Logger logger = Logger.getLogger(ProductControllerSpec.class.getName());

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
      .append("product_name", "apples")
      .append("threshold", 4)
      .append("tags",
      new ArrayList<String>(
        Arrays.asList( new String[] {
          "produce",
          "bulk",
          "perishable"
        })))
    );
    testProducts.add(
      new Document()
      .append("product_name", "bananas")
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
      .append("product_name", "Cereal")
      .append("threshold", 1)
      .append("tags",
      new ArrayList<String>(Arrays.asList(new String[] {
        "nonperishable",
        "grains",
        "boxed"
      })))
    );

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
  public void canGetAllProducts() throws IOException{
    String path = "api/products";
    Context ctx = mockContext(path);

    productController.getProducts(ctx);
    Product[] returnedProducts = returnedProducts(ctx);
    logger.info("Returned products (canGetAllProducts): " + returnedProducts);

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
    logger.info("Returned products (canGetProduceProducts): " + resultProducts);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(2, resultProducts.length);

    for (Product product: resultProducts) {
      assertTrue(product.tags.indexOf("produce") >= 0);
    }
  }

  @Test
  public void respondsCorrectlyToInvalidTag() {
    //this tag does not exist anywhere in the database
    mockReq.setQueryString("tags=foo");
    Context ctx = mockContext("api/products");

    assertThrows(ValidationException.class, () -> {
      productController.getProducts(ctx);
    });
  }

  @Test
  public void canGetApples() throws IOException {
    mockReq.setQueryString("product_name=apples");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(1, resultProducts.length);

    for (Product product: resultProducts) {
      assertEquals("apples", product.product_name);
    }
  }

}
