package umm3601.product;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.elemMatch;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.Map;


import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import org.bson.UuidRepresentation;

import org.mongojack.JacksonMongoCollection;

import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.bson.Document;

import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.HttpCode;

public class ProductController {

  private final JacksonMongoCollection<Product> productCollection;

  private static final String NAME_KEY = "product_name";
  private static final String THRESHOLD_KEY = "threshold";
  private static final String TAGS_KEY = "tags";

  public ProductController(MongoDatabase database) {
    productCollection = JacksonMongoCollection.builder().build(
      database,
      "products",
      Product.class,
      UuidRepresentation.STANDARD);
  }

  public void getProduct(Context ctx) {
    String id = ctx.pathParam("id");
    Product product;

    try {
      product = productCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new NotFoundResponse("The requested id wasn't a legal Mongo Object ID.");
    }
    if (product == null) {
      throw new NotFoundResponse("The requested product was not found.");
    } else {
      ctx.json(product);
    }
  }

  /**
   * Get a JSON response with a list of all the products.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getProducts(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the products with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Product> matchingProducts = productCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of products returned by
    // the database.
    ctx.json(matchingProducts);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
      filters.add(eq(NAME_KEY, ctx.queryParam(NAME_KEY)));
    }

    if (ctx.queryParamMap().containsKey(THRESHOLD_KEY)) {
      int targetThreshold = ctx.queryParamAsClass(THRESHOLD_KEY, Integer.class).get();
      filters.add(eq(THRESHOLD_KEY, targetThreshold));
    }


    if (ctx.queryParamMap().containsKey(TAGS_KEY)) {
      //take the list of tags and separate them into an array
      String[] tags = ctx.queryParam(TAGS_KEY).split("\\");
      for (String tag: tags) {
        filters.add(elemMatch(TAGS_KEY, eq(TAGS_KEY, tag)));
      }
    }

    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);
    return combinedFilter;
  }

  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * Get a JSON response with a list of all the products.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewProduct(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Product` provided in this context is
     * a "legal" product. It checks the following things (in order):
     *    - The product has a value for the name (`usr.name != null`)
     *    - The product name is not blank (`usr.name.length > 0`)
     */
    Product newProduct = ctx.bodyValidator(Product.class)
      .check(itm -> itm.product_name != null && itm.product_name.length() > 0, "Product must have a non-empty product name")
      .get();

    productCollection.insertOne(newProduct);

    // 201 is the HTTP code for when we successfully
    // create a new resource (a product in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpCode.CREATED);
    ctx.json(Map.of("id", newProduct._id));
  }

  /**
   * Delete the product specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteProduct(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = productCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an product not in the system?");
    }
  }
}
