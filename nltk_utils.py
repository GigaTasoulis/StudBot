import nltk
# nltk.download('punkt') # package me pretrained tokenizer.
from nltk.stem.porter import PorterStemmer # for stemming
stemmer = PorterStemmer()

def tokenize(sentence):
    return nltk.word_tokenize(sentence)

def stemming(word):
    return stemmer.stem(word.lower())

def bag_of_words(tokenized_sentence,all_words):
    pass



a = "What is today's announcements?"
print(a)
a = tokenize(a)
print(a)

words = ["organize","organizes","organizing"]
stemmed_words = [stemming(word) for word in words]
print(stemmed_words)
