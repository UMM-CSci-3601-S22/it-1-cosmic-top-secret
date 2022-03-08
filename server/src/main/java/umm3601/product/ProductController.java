package umm3601.product;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.and;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;


import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.UuidRepresentation;

import org.mongojack.JacksonMongoCollection;

import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.bson.Document;

import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;

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

  public void getProducts(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    ArrayList<Product> matchingProducts = productCollection
    .find(combinedFilter)
    .sort(sortingOrder)
    .into(new ArrayList<>());

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

    /*
    if (ctx.queryParamMap().containsKey(TAGS_KEY)) {
      //take the list of tags and separate them into an array
      String[] tags = ctx.queryParam(TAGS_KEY).split("\\");
      for (String tag: tags) {
        filters.add();
      }
    }
    */

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


}
