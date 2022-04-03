const { ApolloServer, gql } = require('apollo-server');
const uuid  = require('uuid');
const axios = require('axios');
const redis = require('redis');
const bluebird = require('bluebird');
const redisClient = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const UNSPLASH_API_ACCESS_KEY = "Bot6VUwXKAjkIehPQjKdGat-ZkycKWQBoVneai4UldY";

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

const typeDefs = gql`

 #typeDefs
 type ImagePost {
    id : ID!
    url : String!
    posterName : String!
    description : String
    userPosted : Boolean!
    binned : Boolean!
  }

  #Queries
  type Query {
      unsplashImages(pageNum: Int): [ImagePost]
      binnedImages : [ImagePost]
      userPostedImages : [ImagePost]
  }

  #Mutations
  type Mutation {
    uploadImage(url: String!, description: String, posterName: String) : ImagePost
    updateImage(id: ID!, url: String, posterName: String, description: String, userPosted: Boolean, binned: Boolean) : ImagePost
    deleteImage(id: ID!) : ImagePost
  }

`;

async function getUnSplashImages(pageNum) {
  // console.log("before", pageNum);
  // pageNum = 1;
  console.log("after pageNum" + pageNum);
  let { data } = await axios.get(`https://api.unsplash.com/photos?page=${pageNum}&client_id=${UNSPLASH_API_ACCESS_KEY}`);
  //console.log(`https://api.unsplash.com/photos?page=${pageNum}&client_id=${UNSPLASH_API_ACCESS_KEY}`);
  let ImageList = [];
  let description;
  for (index = 0; index < data.length; index++){

    if (data[index].description === null) {
      if (data[index].alt_description === null) {
        description = 'NA';
      } else {
        description = data[index].alt_description;
      }
    } else {
      description = data[index].description;
    }

    let singeImage = {
      id: data[index].id,
      url: data[index].urls.raw,
      posterName: data[index].user.name,
      description: description, 
      userPosted: false,
      binned: false
    };
    ImageList.push(singeImage);
  }
  
  return ImageList;
}


async function getBinnedImages() {

  let ImageList = [];
  let imageIdList = await redisClient.lrangeAsync("ImageList", 0, -1);
  // console.log(imageIdList);
  // console.log(imageIdList.length);
  for (let index = 0; index < imageIdList.length; index++){
    //console.log(imageIdList[index]);
    let image = await redisClient.hgetAsync('imageSet',imageIdList[index]);
    //console.log(image);
    ImageList.push(JSON.parse(image));
    console.log(ImageList);
  }
  return ImageList;
}

async function getUserPostedImages() {
  let ImageList = [];
  let imageIdList = await redisClient.lrangeAsync("userImageList", 0, -1);

  for (let index = 0; index < imageIdList.length; index++){
    //console.log(imageIdList[index]);
    let image = await redisClient.hgetAsync('userImageSet',imageIdList[index]);
    //console.log(image);
    ImageList.push(JSON.parse(image));
    console.log(ImageList);
  }

  return ImageList; 
}

async function uploadImage(url, description, posterName) {

  console.log("uploadImages");
  console.log(url, description, posterName);
  
  let image = {
    id: uuid.v4(),
    url: url,
    posterName: posterName,
    description: description,
    userPosted: true,
    binned: false
  };

  await redisClient.hsetAsync('userImageSet', image.id, JSON.stringify(image));
  await redisClient.lpushAsync('userImageList', image.id);
}

async function deleteImage(id) {
   
    await redisClient.hdelAsync('userImageSet', id);
    await redisClient.lremAsync('userImageList', 0, id);
}

async function updateImage(id, url, posterName, description, userPosted, binned) {
  console.log("in update Image");
  console.log(id, url, posterName, description, userPosted, binned);
  let imageUpdated = {
    id: id,
    url: url,
    posterName: posterName,
    description: description,
    userPosted: userPosted,
    binned: binned
  };

  let exists = await redisClient.hexistsAsync('imageSet',imageUpdated.id);
  console.log("EXISTS", exists);
  if (exists === 0) {
    //await redisClient.setAsync(`${id}`, JSON.stringify(imageUpdated));
    console.log("add");
    await redisClient.hsetAsync('imageSet', imageUpdated.id, JSON.stringify(imageUpdated));
    await redisClient.lpushAsync('ImageList', imageUpdated.id);
  } else {
    console.log("remove");
    await redisClient.hdelAsync('imageSet', imageUpdated.id);
    await redisClient.lremAsync('ImageList', 0, imageUpdated.id);
  }

   
}

// const ImagePostData = [
//   {
//   id: 1,
//   url: "String!",
//   posterName: "String!",
//   description: "String",
//   userPosted: false,
//   binned: false
//   }
// ];

const resolvers = {
  Query: {
    //unsplashImages: (_, args) => ImagePostData,
    unsplashImages: async(_, args) => await getUnSplashImages(args.pageNum),

    binnedImages: async () => await getBinnedImages(),

    userPostedImages: async () => await getUserPostedImages()
  
  },

  Mutation: {
    uploadImage: async (_, args) => await uploadImage(args.url, args.description, args.posterName),

    deleteImage: async (_, args) => await deleteImage(args.id),

    updateImage: async (_, args) =>  await updateImage(args.id, args.url, args.posterName, args.description, args.userPosted, args.binned)
  
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}🚀 `);
});