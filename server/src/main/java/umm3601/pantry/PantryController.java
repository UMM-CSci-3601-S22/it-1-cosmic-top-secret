package umm3601.pantry;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.all;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
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

public class PantryController {

  private final JacksonMongoCollection<Pantry> pantryCollection;
  private static final String PURCHASEDATE_KEY = "purchaseDate";
  private static final String TAGS_KEY = "tags";
  private static final String NOTES_KEY = "notes";

  public PantryController(MongoDatabase database) {
    pantryCollection = JacksonMongoCollection.builder().build(
      database,
      "pantry",
      Pantry.class,
      UuidRepresentation.STANDARD);
  }

  public void getOnePantryInput(Context ctx) {
    String id = ctx.pathParam("id");
    Pantry pantry;

    try {
      pantry = pantryCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new NotFoundResponse("The requested id wasn't a legal Mongo Object ID.");
    }
    if (pantry == null) {
      throw new NotFoundResponse("The requested pantry was not found.");
    } else {
      ctx.json(pantry);
    }
  }

  /**
   * Get a JSON response with a list of all the products in the pantry.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getPantry(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    ArrayList<Pantry> matchingPantryProducts = pantryCollection
    .find(combinedFilter)
    .sort(sortingOrder)
    .into(new ArrayList<>());

    ctx.json(matchingPantryProducts);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(PURCHASEDATE_KEY)) {
      filters.add(eq(PURCHASEDATE_KEY, ctx.queryParam(PURCHASEDATE_KEY)));
    }

    if (ctx.queryParamMap().containsKey(TAGS_KEY)) {
      //take the list of tags and separate them into an array
      String[] tags = ctx.queryParam(TAGS_KEY).split("\\\\");
        filters.add(all(TAGS_KEY, new ArrayList<String>(Arrays.asList(tags))));
    }

    if (ctx.queryParamMap().containsKey(NOTES_KEY)) {
      filters.add(eq(NOTES_KEY, ctx.queryParam(NOTES_KEY)));
    }

    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);
    return combinedFilter;
  }

  private Bson constructSortingOrder(Context ctx) {
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "purchaseDate");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * Add the Pantry product specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewPantryProduct(Context ctx) {
    Pantry newPantryProduct = ctx.bodyValidator(Pantry.class)

      .get();
    pantryCollection.insertOne(newPantryProduct);

    ctx.status(HttpCode.CREATED);
    ctx.json(Map.of("id", newPantryProduct._id));
  }

  /**
   * Delete the pantry product specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deletePantryProduct(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = pantryCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an pantry product not in the system?");
    }
  }
}
