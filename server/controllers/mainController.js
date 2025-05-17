/**
 * GET /
 * Homepage 
*/
exports.homepage = async (req, res) => {
  const locals = {
    title: "My Notes",
    description: "Make Your Own Notes.",
  }
  res.render('index', {
    locals,
    layout: '../views/layouts/front-page'
  });
}


/**
 * GET /
 * community 
*/
exports.community = async (req, res) => {
  const locals = {
    title: "community - My Notes",
    description: "Make Your Own Notes.",
  }
  res.render('community', locals);
}

/**
 * GET /
 * About 
*/

exports.about = async (req, res) => {
  const locals = {
    title: "About - GatheringTech",
    description: "Learn about GatheringTech - Where Minds & Technology Meet",
  }
  res.render('about', locals);
}