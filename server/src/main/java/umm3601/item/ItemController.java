package umm3601.item;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;

/**
 * Controller that manages requests for info about items.
 */
public class ItemController {

  private static final String NAME_KEY = "name";
  private static final String COMMENT_KEY = "comment";
  private static final String AMMOUNT_KEY = "ammount";
  private static final String MINTHRESHOLD_KEY = "minThreshold";
  private static final String TAGS_KEY = "tags";
  private final JacksonMongoCollection<Item> itemCollection;

  /**
   * Construct a controller for items.
   *
   * @param database the database containing item data
   */
  public ItemController(MongoDatabase database) {
    itemCollection = JacksonMongoCollection.builder().build(
        database,
        "items",
        Item.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Get the single item specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getItem(Context ctx) {
    String id = ctx.pathParam("id");
    Item item;

    try {
      item = itemCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested item id wasn't a legal Mongo Object ID.");
    }
    if (item == null) {
      throw new NotFoundResponse("The requested item was not found");
    } else {
      ctx.json(item);
    }
  }

  /**
   * Get a JSON response with a list of all the items.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getItems(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the items with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Item> matchingItems = itemCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of items returned by
    // the database.
    ctx.json(matchingItems);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with a blank document

    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
        filters.add(regex(NAME_KEY,  Pattern.quote(ctx.queryParam(NAME_KEY)), "i"));
    }
    if (ctx.queryParamMap().containsKey(COMMENT_KEY)) {
      filters.add(regex(COMMENT_KEY,  Pattern.quote(ctx.queryParam(COMMENT_KEY)), "i"));
    }
    if (ctx.queryParamMap().containsKey(MINTHRESHOLD_KEY)) {
      filters.add(regex(MINTHRESHOLD_KEY,  Pattern.quote(ctx.queryParam(MINTHRESHOLD_KEY)), "i"));
    }
    if (ctx.queryParamMap().containsKey(AMMOUNT_KEY)) {
      filters.add(regex(AMMOUNT_KEY,  Pattern.quote(ctx.queryParam(AMMOUNT_KEY)), "i"));
    }
    if (ctx.queryParamMap().containsKey(TAGS_KEY)) {
      filters.add(regex(TAGS_KEY,  Pattern.quote(ctx.queryParam(TAGS_KEY)), "i"));
    }

    // Combine the list of filters into a single filtering document.
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
   * Get a JSON response with a list of all the items.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewItem(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Item` provided in this context is
     * a "legal" item. It checks the following things (in order):
     *    - The item has a value for the name (`usr.name != null`)
     *    - The item name is not blank (`usr.name.length > 0`)
     *    - The provided email is valid (matches EMAIL_REGEX)
     *    - The provided age is > 0
     *    - The provided role is valid (one of "admin", "editor", or "viewer")
     *    - A non-blank company is provided
     */
    Item newItem = ctx.bodyValidator(Item.class)
      .check(itm -> itm.name != null && itm.name.length() > 0, "Item must have a non-empty item name")
      .get();

    itemCollection.insertOne(newItem);

    // 201 is the HTTP code for when we successfully
    // create a new resource (a item in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpCode.CREATED);
    ctx.json(Map.of("id", newItem._id));
  }

  /**
   * Delete the item specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteItem(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = itemCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
  }
}
